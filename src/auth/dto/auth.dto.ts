import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class AuthDto {
    @IsOptional()
    @IsString()
    name: string

    @IsString({
        message: 'email is required'
    })
    @IsEmail()
    email: string

    @MinLength(6, {
        message: 'password must have at least 6 characters,'
    })
    @IsString({
        message: 'password is required'
    })
    password: string
}