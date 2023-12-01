import { ApiProperty } from "@nestjs/swagger";
import { IsUrl } from "class-validator";

export class ScraperRequestDto {
  @ApiProperty({
    description: "Website Url",
    required: true,
    example: "https://www.cinemaplus.az/az/cinema/about-cinemaplus/28-mall/",
  })
  //TODO: Implement validation for the 'url' field to ensure it contains a valid URL format.
  // Ensure to handle edge cases, such as trailing slash consistency, allowed protocols (http, https)
  @IsUrl(
    {
      require_tld: true,
      require_protocol: true,
      protocols: ["http", "https"],
    },
    {
      message: "Invalid URL format. Please provide a valid URL with http or https protocol.",
    }
  )
  url: string;
}
