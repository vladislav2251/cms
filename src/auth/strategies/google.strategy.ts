import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { VerifiedCallback } from "passport-jwt";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) 
    {
        super({
            clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow('SERVER_URL') + '/auth/google/callback',
            scope: ['profile', 'email']
        })
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifiedCallback) {
        const {displayName, emails, photos} = profile

        const user = {
            email: emails?.[0]?.value,
            name: displayName,
            picture: photos?.[0]?.value
        }

        done(null, user)
    }
}