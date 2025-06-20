import { Icon } from "@repo/ui/media/icon";
import { FaApple, FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

type AuthProviderIconProps = {
  strategy: string;
};

export default function AuthProviderIcon(props: AuthProviderIconProps) {
  const { strategy } = props;

  const isExternalAuth = strategy.startsWith("oauth2:");

  if (!isExternalAuth) {
    return null;
  }

  let providerIcon: React.ComponentType | undefined;

  switch (strategy.split(":")[1]) {
    case "google":
      providerIcon = FcGoogle;
      break;
    case "github":
      providerIcon = FaGithub;
      break;
    case "apple":
      providerIcon = FaApple;
      break;
    default:
      providerIcon = undefined;
      break;
  }

  return <Icon as={providerIcon} />;
}
