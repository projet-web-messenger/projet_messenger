import { Module } from '@nestjs/common';
import { UserResolver, FriendRequestResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [UserResolver, FriendRequestResolver, UserService],
  exports: [UserService],
})
export class UserModule {}