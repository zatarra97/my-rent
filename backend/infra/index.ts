import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as github from "@pulumi/github";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
//   Risorse (Lambda, bucket, CloudFront) sull'account `personal`.
//   DB su RDS shared-db (account bekboard): qui si passano solo le credenziali.
// ---------------------------------------------------------------------------
const config = new pulumi.Config();
const stack = pulumi.getStack();
const project = "myrent";

// Database — shared-db (config diretta, nessuna risorsa RDS creata qui)
const dbHost = config.require("dbHost");
const dbPort = config.getNumber("dbPort") ?? 3306;
const dbUsername = config.get("dbUsername") || "admin";
const dbPassword = config.requireSecret("dbPassword");
const dbName = config.get("dbName") || "myrent";

// Password condivisa dell'app (validata dal middleware Express)
const appPassword = config.requireSecret("appPassword");

// CORS — dopo il primo deploy aggiornare `allowedOrigins` con l'URL CloudFront
const allowedOriginsRaw = config.get("allowedOrigins") || "http://localhost:5173";
const corsOrigins = allowedOriginsRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Nome del bucket allegati (privato)
const allegatiBucketName = `${project}-allegati-zatarra97`;

// ---------------------------------------------------------------------------
// IAM Role Lambda
// ---------------------------------------------------------------------------
const lambdaRole = new aws.iam.Role(`${project}-lambda-role`, {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: { Service: "lambda.amazonaws.com" },
        Effect: "Allow",
      },
    ],
  }),
  tags: { Project: project, Environment: stack },
});

new aws.iam.RolePolicyAttachment(`${project}-lambda-logs`, {
  role: lambdaRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

// Presigned PUT+GET+DELETE su bucket allegati privato → servono anche GetObject
new aws.iam.RolePolicy(`${project}-lambda-s3-policy`, {
  role: lambdaRole.name,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
        Resource: `arn:aws:s3:::${allegatiBucketName}/*`,
      },
    ],
  }),
});

// ---------------------------------------------------------------------------
// Lambda Function
// ---------------------------------------------------------------------------
const lambdaFunction = new aws.lambda.Function(
  `${project}-api`,
  {
    runtime: "nodejs22.x",
    architectures: ["arm64"],
    handler: "handler.handler",
    role: lambdaRole.arn,
    code: new pulumi.asset.FileArchive(path.resolve(__dirname, "../dist")),
    memorySize: 256,
    timeout: 30,
    environment: {
      variables: {
        DB_HOST: dbHost,
        DB_PORT: String(dbPort),
        DB_USER: dbUsername,
        DB_PASSWORD: dbPassword,
        DB_DATABASE: dbName,
        APP_PASSWORD: appPassword,
        S3_ALLEGATI_BUCKET: allegatiBucketName,
        S3_REGION: "eu-north-1",
        CORS_FRONTEND: allowedOriginsRaw,
        NODE_ENV: "production",
      },
    },
    tags: { Project: project, Environment: stack },
  },
  { ignoreChanges: ["code"] }
);

// ---------------------------------------------------------------------------
// API Gateway HTTP v2 (nessun authorizer: l'auth è nel middleware Express)
// ---------------------------------------------------------------------------
const httpApi = new aws.apigatewayv2.Api(`${project}-http-api`, {
  protocolType: "HTTP",
  corsConfiguration: {
    allowOrigins: corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-App-Password"],
    allowCredentials: true,
    maxAge: 86400,
  },
  tags: { Project: project, Environment: stack },
});

const lambdaIntegration = new aws.apigatewayv2.Integration(`${project}-lambda-integration`, {
  apiId: httpApi.id,
  integrationType: "AWS_PROXY",
  integrationUri: lambdaFunction.arn,
  payloadFormatVersion: "2.0",
});

new aws.apigatewayv2.Route(`${project}-route-default`, {
  apiId: httpApi.id,
  routeKey: "$default",
  target: pulumi.interpolate`integrations/${lambdaIntegration.id}`,
  authorizationType: "NONE",
});

new aws.apigatewayv2.Stage(`${project}-stage`, {
  apiId: httpApi.id,
  name: "$default",
  autoDeploy: true,
});

new aws.lambda.Permission(`${project}-api-lambda-perm`, {
  action: "lambda:InvokeFunction",
  function: lambdaFunction.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${httpApi.executionArn}/*/*`,
});

// ---------------------------------------------------------------------------
// S3 Allegati Bucket — ricevute/cedolini PDF (PRIVATO, presigned URL)
// ---------------------------------------------------------------------------
const allegatiBucket = new aws.s3.BucketV2(`${project}-allegati`, {
  bucket: allegatiBucketName,
  tags: { Project: project, Environment: stack },
});

new aws.s3.BucketPublicAccessBlock(`${project}-allegati-block`, {
  bucket: allegatiBucket.id,
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
});

// CORS per upload/download diretto browser <-> S3 via presigned URL
new aws.s3.BucketCorsConfigurationV2(`${project}-allegati-cors`, {
  bucket: allegatiBucket.id,
  corsRules: [
    {
      allowedHeaders: ["*"],
      allowedMethods: ["PUT", "GET"],
      allowedOrigins: [...corsOrigins, "http://localhost:5173"],
      maxAgeSeconds: 3000,
    },
  ],
});

// ---------------------------------------------------------------------------
// S3 Frontend Bucket + CloudFront (SPA)
// ---------------------------------------------------------------------------
const frontendBucket = new aws.s3.BucketV2(`${project}-frontend`, {
  bucket: `${project}-webapp`,
  forceDestroy: true,
  tags: { Project: project, Environment: stack },
});

new aws.s3.BucketPublicAccessBlock(`${project}-frontend-block`, {
  bucket: frontendBucket.id,
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
});

const oac = new aws.cloudfront.OriginAccessControl(`${project}-oac`, {
  originAccessControlOriginType: "s3",
  signingBehavior: "always",
  signingProtocol: "sigv4",
});

const cloudfront = new aws.cloudfront.Distribution(`${project}-cdn`, {
  enabled: true,
  defaultRootObject: "index.html",
  origins: [
    {
      domainName: frontendBucket.bucketRegionalDomainName,
      originId: `s3-${project}-frontend`,
      originAccessControlId: oac.id,
    },
  ],
  defaultCacheBehavior: {
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD"],
    targetOriginId: `s3-${project}-frontend`,
    viewerProtocolPolicy: "redirect-to-https",
    forwardedValues: { queryString: false, cookies: { forward: "none" } },
    compress: true,
  },
  customErrorResponses: [
    { errorCode: 403, responseCode: 200, responsePagePath: "/index.html", errorCachingMinTtl: 0 },
    { errorCode: 404, responseCode: 200, responsePagePath: "/index.html", errorCachingMinTtl: 0 },
  ],
  restrictions: { geoRestriction: { restrictionType: "none" } },
  viewerCertificate: { cloudfrontDefaultCertificate: true },
  tags: { Project: project, Environment: stack },
});

new aws.s3.BucketPolicy(`${project}-frontend-policy`, {
  bucket: frontendBucket.id,
  policy: pulumi.all([frontendBucket.arn, cloudfront.arn]).apply(([bucketArn, cfArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "AllowCloudFrontServicePrincipal",
          Effect: "Allow",
          Principal: { Service: "cloudfront.amazonaws.com" },
          Action: "s3:GetObject",
          Resource: `${bucketArn}/*`,
          Condition: { StringEquals: { "AWS:SourceArn": cfArn } },
        },
      ],
    })
  ),
});

// ---------------------------------------------------------------------------
// IAM CI User (unico: monorepo con un solo repo → una sola coppia di chiavi)
// ---------------------------------------------------------------------------
const ciUser = new aws.iam.User(`${project}-ci`, {
  name: `${project}-ci`,
  tags: { Project: project },
});

new aws.iam.UserPolicy(`${project}-ci-policy`, {
  user: ciUser.name,
  policy: pulumi
    .all([frontendBucket.arn, cloudfront.arn, lambdaFunction.arn])
    .apply(([bucketArn, cfArn, lambdaArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "FrontendS3Sync",
            Effect: "Allow",
            Action: ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetObject"],
            Resource: [bucketArn, `${bucketArn}/*`],
          },
          {
            Sid: "CloudFrontInvalidation",
            Effect: "Allow",
            Action: "cloudfront:CreateInvalidation",
            Resource: cfArn,
          },
          {
            Sid: "LambdaDeploy",
            Effect: "Allow",
            Action: ["lambda:UpdateFunctionCode", "lambda:GetFunction"],
            Resource: lambdaArn,
          },
        ],
      })
    ),
});

const ciKey = new aws.iam.AccessKey(`${project}-ci-key`, {
  user: ciUser.name,
});

// ---------------------------------------------------------------------------
// GitHub ActionsSecret sul repo ESISTENTE `my-rent`
//   (non si crea/importa la risorsa Repository: ActionsSecret basta il nome)
//   Provider github: PAT da $GITHUB_TOKEN, owner da `github:owner`.
// ---------------------------------------------------------------------------
const REPO = "my-rent";

function repoSecret(logicalName: string, secretName: string, value: pulumi.Input<string>) {
  new github.ActionsSecret(logicalName, { repository: REPO, secretName, value });
}

repoSecret(`${project}-aws-akid`, "AWS_ACCESS_KEY_ID", ciKey.id);
repoSecret(`${project}-aws-secret`, "AWS_SECRET_ACCESS_KEY", ciKey.secret);
repoSecret(`${project}-aws-region`, "AWS_REGION", "eu-north-1");
repoSecret(`${project}-lambda-name`, "LAMBDA_NAME", lambdaFunction.name);
repoSecret(`${project}-s3-bucket`, "S3_BUCKET", frontendBucket.bucket);
repoSecret(`${project}-cf-distribution`, "CLOUDFRONT_DISTRIBUTION_ID", cloudfront.id);
repoSecret(`${project}-vite-backend-url`, "VITE_BACKEND_URL", pulumi.interpolate`${httpApi.apiEndpoint}`);

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const apiUrl = httpApi.apiEndpoint;
export const cloudfrontUrl = pulumi.interpolate`https://${cloudfront.domainName}`;
export const cloudfrontDistributionId = cloudfront.id;
export const frontendBucketName = frontendBucket.bucket;
export const allegatiBucketName_ = allegatiBucket.bucket;
export const lambdaName = lambdaFunction.name;
export const ciAccessKeyId = ciKey.id;
export const ciSecretAccessKey = pulumi.secret(ciKey.secret);
