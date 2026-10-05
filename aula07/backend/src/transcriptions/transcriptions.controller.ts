import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadedAudioFile } from '../storage/uploaded-audio-file';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { TranscriptionsService } from './transcriptions.service';

@Controller('transcriptions')
@UseGuards(JwtAuthGuard)
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    return {
      data: await this.transcriptionsService.listByUser(user.sub),
    };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return {
      data: await this.transcriptionsService.findOneForUser(user.sub, id),
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedAudioFile | undefined,
    @Body() dto: CreateTranscriptionDto,
  ) {
    return {
      data: await this.transcriptionsService.create(user.sub, file, dto),
    };
  }
}
