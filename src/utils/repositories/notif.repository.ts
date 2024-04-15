import { Injectable } from "@nestjs/common";
import { Notifications } from "src/notif/entities/notif.entity";
import { Repository } from "typeorm";

@Injectable()
export class NotifRepository extends Repository<Notifications> { }