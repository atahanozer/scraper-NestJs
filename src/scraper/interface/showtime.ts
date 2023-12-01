import { ApiProperty } from "@nestjs/swagger";

export class Showtime {
  @ApiProperty({
    description: "The unique identifier for the showtime.",
    example: "12345",
  })
  showtimeId: string;

  @ApiProperty({
    description: "The name of the cinema where the showtime is scheduled.",
    example: "CinemaXYZ",
  })
  cinemaName: string;

  @ApiProperty({
    description: "The title of the movie for the showtime.",
    example: "The Movie Title",
  })
  movieTitle: string;

  @ApiProperty({
    description: "The scheduled showtime in UTC format.",
    example: "2023-01-01T12:00:00Z",
  })
  showtimeInUTC: string;

  @ApiProperty({
    description: "The booking link for the showtime.",
    example: "https://example.com/book/12345",
  })
  bookingLink: string;

  @ApiProperty({
    type: [String],
    description: "List of attributes related to the showtime.",
    example: ["3D", "VIP"],
  })
  attributes: string[];
}
