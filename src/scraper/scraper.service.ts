import { Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { ScraperResponseDto } from "./dto/scraper-response.dto";
import * as cheerio from "cheerio";
import { WebsiteData } from "./interface/website-data";
import { ShowtimeService } from "../showtime/showtime.service";
import { Showtime } from "./interface/showtime";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
];
//'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
//'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
//'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly showtimeService: ShowtimeService
  ) {}

  private async fetchHtml(ur: string): Promise<string> {
    // Get random UA
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
    // Set UA in headers
    const headers = {
      "User-Agent": ua,
    };

    console.log("fetchHtml");

    const response = await firstValueFrom(
      this.httpService.get<string>(ur, { headers }).pipe(
        catchError((error: AxiosError) => {
          const msg = error?.response?.data || error?.response || error;
          this.logger.error(msg);
          throw "An error happened!";
        })
      )
    );
    console.log("response", response.request);
    return response.data;
  }

  private parseHtml(html: string, url: string): WebsiteData {
    const baseUrl = this.getBaseUrl(url);

    const $ = cheerio.load(html);
    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content") ?? "";
    const faviconUrl = $('link[rel="shortcut icon"]').attr("href") ?? "";

    const scriptUrls: string[] = [];
    $("script").each((_i, el) => {
      const src = $(el).attr("src");
      if (src) {
        scriptUrls.push(src);
      }
    });

    const stylesheetUrls: string[] = [];
    $('link[rel="stylesheet"]').each((_i, el) => {
      const href = $(el).attr("href");
      if (href) {
        stylesheetUrls.push(href);
      }
    });

    const imageUrls: string[] = [];
    $("img").each((_i, el) => {
      const src = $(el).attr("src");
      if (src) {
        imageUrls.push(src);
      }
    });

    /*     const showtimes2: Showtime[] = [
      //Sample data
      {
        showtimeId: "0009-170678",
        cinemaName: "Al Hamra Mall - Ras Al Khaimah",
        movieTitle: "Taylor Swift: The Eras Tour",
        showtimeInUTC: "2023-11-03T17:30:00Z",
        bookingLink: "https://uae.voxcinemas.com/booking/0009-170678",
        attributes: ["Standard"],
      },
    ]; */

    /*
    TODO: Implement showtime scraping functionality. Specific requirements are as follows:
     - Navigate to the VOX Cinemas showtime listing at 'https://uae.voxcinemas.com/showtimes'
     - Choose a random cinema location. For consistency in testing, you might prefer selecting 'Al Hamra Mall - Ras Al Khaimah' or any other location of choice from 'https://voxcinemas.com'.
     - Scrape showtime data for the selected cinema for the date '2023-11-03' or any other date. The expected URL format is 'https://uae.voxcinemas.com/showtimes?c=al-hamra-mall-ras-al-khaimah&d=20231103'.
     - The scraped data should include showtimeId, cinemaName, movieTitle, showtimeInUTC, bookingLink, and attributes. Populate the 'showtimes' array with this data.
     - Ensure that the scraping logic is robust, handling potential inconsistencies in the webpage structure and providing informative error messages if scraping fails.
     - Consider efficiency and performance in your implementation, avoiding unnecessary requests or data processing operations.
     */

    // Implement showtime scraping functionality
    const showtimes: Showtime[] = [];

    try {
      const cinemaName = "Al Hamra Mall - Ras Al Khaimah";

      // const cinemaLocation = "al-hamra-mall-ras-al-khaimah"; // Replace with any desired cinema location
      const targetDate = "2023-11-23"; // Replace with any desired date
      const showtimeDate = new Date(targetDate);

      // const showtimeURL = `https://uae.voxcinemas.com/showtimes?c=${cinemaLocation}&d=${targetDate}`;
      const showtimeHTML = html; // showtimeResponse.body;

      const showtime$ = cheerio.load(showtimeHTML);

      showtime$(".movie-compare").each((_, movieCompare) => {
        const movieCompare$ = showtime$(movieCompare);
        const movieTitle = movieCompare$.find("aside > div > h2").text().trim();

        movieCompare$.find(".dates .showtimes > li").each((_, showtimesInfo) => {
          const attributes = [];
          const showtimesInfo$ = showtime$(showtimesInfo);

          showtimesInfo$.find("strong").each((_, attribute) => {
            attributes.push(showtime$(attribute).text().trim());
          });

          showtimesInfo$.find("ol > li").each((_, showtimeDetail) => {
            const showTimeDetail$ = $(showtimeDetail);
            const showtimeId = showTimeDetail$.attr("data-id");

            const href = showTimeDetail$.find("a.showtime").attr("href");
            const time = showTimeDetail$.find("a.showtime").text().trim();
            const [hourString, minuteString] = time.split(":");
            let hour = parseInt(hourString);
            const minute = parseInt(minuteString.substring(0, 2));
            const isPm = minuteString.substring(2).toLowerCase() === "pm";
            if (isPm) {
              hour += 12;
            }

            showtimeDate.setHours(hour);
            showtimeDate.setMinutes(minute);
            const showtimeInUTC = showtimeDate.toISOString(); // this needs to be converted from theatre country TZ to UTC (assuming we have TZ info)

            const bookingLink = baseUrl + href;

            const showtimeData: Showtime = {
              showtimeId,
              cinemaName,
              movieTitle,
              showtimeInUTC,
              bookingLink,
              attributes,
            };

            showtimes.push(showtimeData);
          });
        });
      });
    } catch (error) {
      console.error(`Error scraping showtimes: ${error}`);
    }

    return {
      title,
      metaDescription,
      faviconUrl,
      scriptUrls,
      stylesheetUrls,
      imageUrls,
      showtimes,
    };
  }

  private getBaseUrl(url: string) {
    const pathArray = url.split("/");
    const protocol = pathArray[0];
    const host = pathArray[2];
    return protocol + "//" + host;
  }

  async scrape(url: string): Promise<ScraperResponseDto> {
    const html = await this.fetchHtml(url);
    const websiteData: WebsiteData = this.parseHtml(html, url);
    await this.showtimeService.addShowtimes(websiteData.showtimes);
    return {
      requestUrl: url,
      responseData: websiteData,
    };
  }
}
