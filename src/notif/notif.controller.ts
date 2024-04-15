import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UseGuards, HttpStatus } from '@nestjs/common';
import { NotifService } from './notif.service';
import { CurrentUser } from 'src/utils/decorator/userInfo.decorator';
import { AlreadyLoggedInGuard } from 'src/utils/guards/auth.guard';

@UseGuards(AlreadyLoggedInGuard)
@Controller('notif')
export class NotifController {
    constructor(private readonly notifService: NotifService) { }

    @Get()
    getNotifications(@CurrentUser() CurrentUser: any) {
        try {
            return this.notifService.get_Current_Notifications(CurrentUser.sub);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("process")
    processNotification(@CurrentUser() currentUser, @Body() data: any) {
        try {
            return this.notifService.process_Notification(currentUser.sub, data.notifId, data.event);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }
}
