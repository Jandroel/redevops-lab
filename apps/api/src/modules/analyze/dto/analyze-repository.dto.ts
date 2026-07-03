import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString } from "class-validator";
import type { ExperienceLevel, ReportLanguage } from "@redevops-lab/shared";
import { IsGitHubRepositoryUrl } from "../../../common/decorators/is-github-repository-url.decorator.js";

export class AnalyzeRepositoryDto {
  @ApiProperty({
    example: "https://github.com/Jandroel/redevops-lab",
    description: "Public GitHub repository URL."
  })
  @IsString()
  @IsGitHubRepositoryUrl()
  url!: string;

  @ApiProperty({
    enum: ["beginner", "intermediate", "advanced"],
    example: "beginner"
  })
  @IsIn(["beginner", "intermediate", "advanced"])
  level!: ExperienceLevel;

  @ApiProperty({
    enum: ["es", "en"],
    example: "es"
  })
  @IsIn(["es", "en"])
  language!: ReportLanguage;
}
