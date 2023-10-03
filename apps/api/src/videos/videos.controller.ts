// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Render,
// } from '@nestjs/common'
// import { Prisma } from '@prisma/client'
// import { VideosService } from './videos.service'

// @Controller('videos')
// export class VideosController {
//   constructor(private readonly videosService: VideosService) {}

//   @Post()
//   async create(@Body() data: any) {
//     return this.videosService.create(data.input)
//   }

//   @Get()
//   findAll() {
//     return this.videosService.findAll()
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.videosService.findOne(id)
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() data: Prisma.VideosUpdateInput) {
//     return this.videosService.update(id, data)
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.videosService.remove(id)
//   }

//   @Get(':id/watch')
//   @Render('watch')
//   watch(@Param('id') id: string) {
//     return this.videosService.watchOne(id)
//   }
// }
