import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserConfig } from "../../models/user-config.model";
import { UserConfigController } from "./user-config.controller";
import { UserConfigService } from "./user-config.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserConfig])],
  controllers: [UserConfigController],
  providers: [UserConfigService],
  exports: [UserConfigService],
})
export class UserConfigModule {}
