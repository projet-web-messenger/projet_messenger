import { ChannelList } from "@/components/app/channel-list";

export type Params = { id: string };

type ChannelLayoutProps = {
  children: Readonly<React.ReactNode>;
};

export default function ChannelLayout({ children }: ChannelLayoutProps) {
  return (
    <div className="flex h-dvh">
      <ChannelList /> {/* ← Cette liste prend de l'espace à gauche */}
      <main className="flex-1">{children}</main> {/* ← Votre page est ici */}
    </div>
  );
}
