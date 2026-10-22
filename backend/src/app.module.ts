import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PropertiesService } from './properties/properties.service';
import { PropertiesController } from './properties/properties.controller';
import { FavoritesController } from './favorites/favorites.controller';

@Module({
  imports: [],
  controllers: [AuthController, PropertiesController, FavoritesController],
  providers: [PrismaService, AuthService, PropertiesService],
})
export class AppModule {}
