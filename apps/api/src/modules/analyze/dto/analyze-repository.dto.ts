import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import type { AiMentorMode, ExperienceLevel, ReportLanguage } from "@redevops-lab/shared";
import { IsGitHubRepositoryUrl } from "../../../common/decorators/is-github-repository-url.decorator.js";

export class AnalyzeRepositoryDto {
  @ApiProperty({
    type: String,
    example: "https://github.com/Jandroel/redevops-lab",
    description: "Public GitHub repository URL."
  })
  @IsString()
  @IsGitHubRepositoryUrl()
  url!: string;

  @ApiProperty({
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    example: "beginner"
  })
  @IsIn(["beginner", "intermediate", "advanced"])
  level!: ExperienceLevel;

  @ApiProperty({
    type: String,
    enum: ["es", "en"],
    example: "es"
  })
  @IsIn(["es", "en"])
  language!: ReportLanguage;

  @ApiPropertyOptional({
    type: String,
    enum: ["learning", "interview", "production", "portfolio", "open-source"],
    example: "learning",
    description: "Optional tone for the AI mentor explanation."
  })
  @IsOptional()
  @IsIn(["learning", "interview", "production", "portfolio", "open-source"])
  mentorMode?: AiMentorMode;
}
