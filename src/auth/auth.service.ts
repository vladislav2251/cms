import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
    EXPIRES_IN = 1;
    REFRESH_TOKEN_NAME = 'refreshToken';

    constructor(
        private jwt: JwtService, 
        private userService: UserService, 
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {}
    
    async login(dto: AuthDto) {
        const user = await this.validateUser(dto);
        const tokens = this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }

    async register(dto: AuthDto) {
        const oldUser = await this.userService.getByEmail(dto.email);
        if (oldUser) {
            throw new BadRequestException('User already exists');
        }

        const user = await this.userService.create(dto);
        const tokens = this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync(refreshToken);
        if (!result) {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.userService.getById(result.id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const tokens = this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }

    issueTokens(userId: string) {
        const data = {id: userId};

        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h',
        });

        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.getByEmail(dto.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    addRefreshTokenToResponse(res: Response, refreshToken: string) {
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + this.EXPIRES_IN);

        res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
            httpOnly: true,
            domain: this.configService.get('SERVER_DOMAIN'),
            expires: expiresIn,
            secure: true,
            sameSite: 'lax',

        });
    }

    removeRefreshTokenToResponse(res: Response) {
        res.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: true,
            domain: this.configService.get('SERVER_DOMAIN'),
            expires: new Date(0),
            secure: true,
            sameSite: 'lax',
            
        });
    }
}
