import { ChannelList } from "@/components/app/channel-list";

export type Params = { id: string };

type ChannelLayoutProps = {
  children: Readonly<React.ReactNode>;
};

export default function ChannelLayout({ children }: ChannelLayoutProps) {
  return (
    <div className="flex h-dvh">
      <ChannelList />
      <main className="flex-1">{children}</main>
    </div>
  );
}
