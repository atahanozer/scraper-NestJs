import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ShowtimeEntity } from "./entity/showtime.entity";
import { DataSource, Repository } from "typeorm";
import { ShowtimeSummaryEntity } from "./entity/showtimeSummary.entity";
import { Showtime } from "src/scraper/interface/showtime";

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(ShowtimeEntity)
    private showtimeEntityRepository: Repository<ShowtimeEntity>,
    @InjectRepository(ShowtimeSummaryEntity)
    private showtimeSummaryEntityRepository: Repository<ShowtimeSummaryEntity>,
    private dataSource: DataSource
  ) {}

  private async updateShowtimeSummary() {
    await this.dataSource.query(`
        INSERT INTO "showtime-summary"
        ("showtimeDate",
         "cinemaName",
         "movieTitle",
         attributes,
         city,
         "showtimeCount")
        select date(showtime."showtimeInUTC" AT TIME ZONE 'UTC'),
            showtime."cinemaName",
            showtime."movieTitle",
            showtime.attributes,
            CASE WHEN showtime.city IS NULL THEN '' ELSE showtime.city END AS city,
            count(*)
        from "showtime"
        group by 1, 2, 3, 4, 5
        ON CONFLICT
            (
            "showtimeDate",
            "cinemaName",
            "movieTitle",
            attributes,
            city
            )
            DO UPDATE
                   SET "showtimeCount"= EXCLUDED."showtimeCount"
    `);
    //TODO: Investigate and resolve the duplication issue in the "showtime-summary" table.
    // If you check the "showtime-summary" table rows you will notice that there duplicate rows.
    // Analyze the current aggregation query to identify why duplicates are being created.
    // Modify the query or the table structure as necessary to prevent duplicate entries.
    // Ensure your solution maintains data integrity and optimizes performance.
  }

  async addShowtimes(showtimes: Showtime[]) {
    for (const showtime of showtimes) {
      try {
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(ShowtimeEntity)
          .values({
            showtimeId: showtime.showtimeId,
            movieTitle: showtime.movieTitle,
            cinemaName: showtime.cinemaName,
            showtimeInUTC: showtime.showtimeInUTC,
            bookingLink: showtime.bookingLink,
            attributes: showtime.attributes,
          })
          .execute();

        //TODO: Implement error handling for cases where a duplicate 'showtimeId' is used during insertion.
        // Consider how the application should behave in this scenario (e.g., skip, replace, or abort the operation).
        // Implement the necessary logic and provide feedback or logging for the operation outcome.
        // Ensure your solution handles such conflicts gracefully without causing data inconsistency or application failure.
      } catch (e) {
        const existingRecord = await this.dataSource.query(`select id from "showtime" where "showtimeId" = '${showtime.showtimeId}'`);

        if (existingRecord) {
          await this.dataSource.query(`
            UPDATE public.showtime
            SET "movieTitle"='${showtime.movieTitle}', "showtimeInUTC"='${showtime.showtimeInUTC}', "bookingLink"='${showtime.bookingLink}'
            WHERE "showtimeId"='${showtime.showtimeId}' AND "cinemaName"='${showtime.cinemaName}';
            `);

          console.log(`Updated existing record for showtimeId: ${showtime.showtimeId} with: ${JSON.stringify(showtime)}`);
        } else {
          throw e;
        }
      }
    }
    await this.updateShowtimeSummary();
  }
}
