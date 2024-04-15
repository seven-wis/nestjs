import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { UsersModule } from '../../users/users.module';
import { SharedModule } from 'src/utils/shared/shared.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => UsersModule),
    ],
    controllers: [TwoFactorAuthController],
    providers: [TwoFactorAuthService],
})
export class TwoFactorAuthModule { }
