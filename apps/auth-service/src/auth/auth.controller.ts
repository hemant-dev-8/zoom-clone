import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user, req.deviceId);
    }

    @Post('guest')
    async guest(@Body() req) {
        return this.authService.guestLogin(req.name, req.deviceId);
    }

    @Post('refresh')
    async refresh(@Body() req) {
        return this.authService.refreshToken(req.refresh_token);
    }

    @Post('register')
    async register(@Body() req) {
        return this.authService.register(req);
    }
}
