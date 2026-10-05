import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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

  @Get(':id/audio')
  async streamAudio(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Headers('range') rangeHeader: string | undefined,
    @Res() response: any,
  ) {
    const audio = await this.transcriptionsService.getAudioForUser(user.sub, id);
    const range = parseRangeHeader(rangeHeader, audio.fileSize);

    response.set({
      'Content-Type': audio.mimeType,
      'Accept-Ranges': 'bytes',
    });

    if (range) {
      response.status(206);
      response.set({
        'Content-Length': range.end - range.start + 1,
        'Content-Range': `bytes ${range.start}-${range.end}/${audio.fileSize}`,
      });
      this.transcriptionsService.createAudioStream(audio.storedFileName, range).pipe(response);
      return;
    }

    response.set({
      'Content-Length': audio.fileSize,
    });
    this.transcriptionsService.createAudioStream(audio.storedFileName).pipe(response);
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

function parseRangeHeader(rangeHeader: string | undefined, fileSize: number) {
  if (!rangeHeader) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);

  if (!match) {
    return null;
  }

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : fileSize - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
    return null;
  }

  return {
    start,
    end: Math.min(end, fileSize - 1),
  };
}
