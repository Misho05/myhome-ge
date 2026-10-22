import { Controller, Get, Post, Query, Body, Headers } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  async findAll(@Query() query: Record<string, string>) {
    return this.propertiesService.findAll(query);
  }

  @Post()
  async create(@Headers('authorization') authHeader: string | undefined, @Body() body: any) {
    return this.propertiesService.create(authHeader, body);
  }
}
