import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { HubbleService } from "./hubble.service";

@Module({
  imports: [HttpModule],
  providers: [HubbleService],
  exports: [HubbleService]
})
export class HubbleModule {}
