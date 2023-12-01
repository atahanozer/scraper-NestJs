import { ApiProperty } from "@nestjs/swagger";
import { Showtime } from "./showtime";

export class WebsiteData {
  @ApiProperty({
    description: "The title of the website.",
    example: "My Movie Website",
  })
  title: string;

  @ApiProperty({
    description: "The meta description of the website.",
    example: "A movie-related website with showtime information.",
  })
  metaDescription: string;

  @ApiProperty({
    description: "The URL of the favicon for the website.",
    example: "https://example.com/favicon.ico",
  })
  faviconUrl: string;

  @ApiProperty({
    description: "List of URLs for script resources.",
    example: ["https://example.com/script1.js", "https://example.com/script2.js"],
  })
  scriptUrls: string[];

  @ApiProperty({
    description: "List of URLs for stylesheet resources.",
    example: ["https://example.com/style1.css", "https://example.com/style2.css"],
  })
  stylesheetUrls: string[];

  @ApiProperty({
    description: "List of URLs for image resources.",
    example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  })
  imageUrls: string[];

  @ApiProperty({
    type: [Showtime],
    description: "List of showtimes for movies.",
  })
  showtimes: Showtime[];
}

export class ScraperResponseDto {
  @ApiProperty({
    description: "The URL of the request.",
    example: "https://example.com/api/scrape",
  })
  requestUrl: string;

  @ApiProperty({
    type: WebsiteData,
    description: "The data retrieved from the website.",
  })
  responseData: WebsiteData;
}
