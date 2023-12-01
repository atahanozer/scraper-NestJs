import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ShowtimeEntity } from "../showtime/entity/showtime.entity";
import { ShowtimeSummaryEntity } from "../showtime/entity/showtimeSummary.entity";

const environments = {
  development: ".env.development",
  staging: ".env.staging",
  production: ".env.production",
};

const environment = process.env.NODE_ENV || "development";
require("dotenv").config({ path: environments[environment] });

console.log(`Using ${environments[environment]} file for ${environment} environment`);

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "scraper",
    entities: [ShowtimeEntity, ShowtimeSummaryEntity],
    synchronize: process.env.DB_SYNCHRONIZE === "true" || false,
    logging: process.env.DB_LOGGING === "true" || false,
  })
);
