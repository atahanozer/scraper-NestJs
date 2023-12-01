//TODO: Refactor this section to use the NestJS configuration management feature.
// Avoid hardcoding sensitive information and use environment variables instead.
// You may need to create a separate configuration module or use an existing one.
// Ensure that the solution is scalable and environment agnostic.

import { Module } from "@nestjs/common";
import { ScraperModule } from "./scraper/scraper.module";
import { ShowtimeModule } from "./showtime/showtime.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import databaseConfig from "./config/database.config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    ScraperModule,
    ShowtimeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
