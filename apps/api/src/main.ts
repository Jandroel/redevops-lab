import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false
  });
  const port = Number(process.env.PORT ?? 3001);
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  app.use(helmet());
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: false
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ReDevOps Lab API")
    .setDescription("Backend API for repository-based DevOps lab generation.")
    .setVersion("0.1.0")
    .addTag("health")
    .addTag("analyze")
    .addTag("reports")
    .addTag("ai")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: false
    }
  });

  await app.listen(port);
  console.log(`ReDevOps Lab API listening on http://localhost:${port}/api`);
  console.log(`Swagger docs available on http://localhost:${port}/api/docs`);
}

void bootstrap();
