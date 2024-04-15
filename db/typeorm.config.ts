import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseConfig {
    constructor(private configService: ConfigService) { }

    public createPostgesDataSourceOptions(): DataSourceOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST'),
            port: +this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASS'),
            database: this.configService.get<string>('DB_NAME'),
            entities: ['dist/**/*.entity{.ts,.js}'],
            migrations: ['dist/db/migrations/*.js'],
            synchronize: false,
            ssl: {
                rejectUnauthorized: false,
                ca: `-----BEGIN CERTIFICATE-----
                MIIEQTCCAqmgAwIBAgIUVOXeXBmN+1VhA6F2PLY/2bLFCZgwDQYJKoZIhvcNAQEM
                BQAwOjE4MDYGA1UEAwwvMDVmZDNmNGYtZmRkNS00OTlmLTg3ZmUtNmRkNDJkM2Yz
                M2NhIFByb2plY3QgQ0EwHhcNMjQwNDEzMjMyMzUxWhcNMzQwNDExMjMyMzUxWjA6
                MTgwNgYDVQQDDC8wNWZkM2Y0Zi1mZGQ1LTQ5OWYtODdmZS02ZGQ0MmQzZjMzY2Eg
                UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKW8HIAh
                K2bsqzZ40ZAMbs25+Ocl+yupE2xNEciH3ygypi3CKMQpLmD7+S/MrvuMZXdVbqHU
                D9AHQPJQqcTD4c3JWVPMDifdvouX70tLH/Xnr+J9y6GtfNj7EsbBP0PH16vvKghl
                kiNmzwRF/7oxqlPTRjiQnp4f3SplOxvjDyra0CB1+QqeAuS/IbiE/EPnGw7bNZ+2
                SDj28z1YNBdsNUdb8LkrxpJuRibmxIV6zlbmiKvOCFoUs3VfYDqrmelVWfb7Zcl5
                5U6pY3sC2uPwQhAHd37RFntkxqSR7ngGJnsyE82aHGim+yV0aUi0cdk87T8eiRZY
                zF3TEvGLMIo7IaDwP27PaAaLTDqjMYHeWY9qy5AsxmksWlalbD4NjqjSS1p/6O2r
                o+rr/jCdDzBkqLr8T17fUQkz5sP4dvr3pv0bcbh6J8mQD/efF4fr1//KxTKMWo+0
                VJwcQtPS+11j2yK/QwJ1eqipqVYENj56VU/htySlcMpMdxKOzPIzIrlDwQIDAQAB
                oz8wPTAdBgNVHQ4EFgQU3TXuVr4gZPaMpT2xCv+D/zbsWoEwDwYDVR0TBAgwBgEB
                /wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAEOqFiecf2V8HSzr
                B2oDe0kbrU/VhkkRu7Evv4TTXXpvUI5ifZfOlcQLHr+3BGatwOEQUqt/gigWo8vq
                +o5ldX04c7AMKm8Ry5xl/cnpwFaxo6O0LqwsRkrFKP80j0EK6E+lukNbCLbrkECX
                xvVrwkr+211u2QjX/5psxiRdvnNnbeXOw90sfMzUzbiK03VR3ijPguto/R0slIEy
                CZn2pU2eElSrG9mCdNWi+Q2XkQUv4GAGaY47rxcGxqoqws8IXgg4Qt9JjL7DgADR
                tGv5YKFBX4iHkdgsf1/uUeas4vE3JzZsW2dIkBkQ8qaJCDCmzlAb+62IbSAYVCVf
                ufCmSEANcgWAOCseCGqXpzjcLWRQtrHvGNn++aygazDrROgH1IJ9OreQnq0DIUHw
                ReHex0+MM7F4Cszsj7u2P4LlXn2P0xCNOBRLIYHdxzgCa/atjECWvepJzW5M5HAh
                5wMmMiwg1R418Xb8yWdZIJaIJtW5kJ/jYJ3CfGTs2qHEAmLOZA==
                -----END CERTIFICATE----- `
            }
        };
    }
}