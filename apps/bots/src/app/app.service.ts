import { Injectable, OnModuleInit } from "@nestjs/common";

import { DiscordBotManagerService } from "./discord-bot-manager.service";

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly discordBotManagerService: DiscordBotManagerService
  ) {}

  async onModuleInit() {
    this.discordBotManagerService.initializeHbbBot();
  }
}
