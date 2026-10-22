import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'myhome-nestjs-secret-2026';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'myhome-salt').digest('hex');
  }

  createToken(userId: string): string {
    const payload = Buffer.from(
      JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 3600 * 1000 }),
    ).toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  verifyToken(token?: string): { userId: string } | null {
    if (!token) return null;
    try {
      const clean = token.replace(/^Bearer\s+/i, '').trim();
      const [payload, sig] = clean.split('.');
      if (!payload || !sig) return null;
      const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
      if (sig !== expectedSig) return null;
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
      if (data.exp < Date.now()) return null;
      return { userId: data.userId };
    } catch {
      return null;
    }
  }

  async getUserFromAuthHeader(authHeader?: string) {
    const decoded = this.verifyToken(authHeader);
    if (!decoded) return null;
    return this.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        favorites: { select: { propertyId: true } },
      },
    });
  }

  async login(email?: string, password?: string) {
    if (!email || !password) {
      throw new BadRequestException('შეიყვანეთ ელ-ფოსტა და პაროლი');
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { favorites: { select: { propertyId: true } } },
    });
    if (!user || user.passwordHash !== this.hashPassword(password)) {
      throw new UnauthorizedException('არასწორი ელ-ფოსტა ან პაროლი');
    }
    const token = this.createToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        favorites: user.favorites,
      },
    };
  }

  async register(body: { name?: string; email?: string; phone?: string; password?: string; role?: string }) {
    const { name, email, phone, password, role } = body;
    if (!name || !email || !phone || !password) {
      throw new BadRequestException('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
    }
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('ეს ელ-ფოსტა უკვე რეგისტრირებულია');
    }
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: this.hashPassword(password),
        role: role || 'USER',
      },
    });
    const token = this.createToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        favorites: [],
      },
    };
  }
}
