import {
  Box,
  Flex,
  FlexProps,
  HStack,
  Img,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  useMenuButton,
} from "@chakra-ui/react";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { HiBan, HiHome, HiLogout, HiSelector, HiShieldExclamation } from "react-icons/hi";

import { User } from "~helpers/types";

type ProfileButtonProps = FlexProps & {
  user: User;
};

const ProfileButton = ({ user }: ProfileButtonProps) => {
  const menuButtonProps = useMenuButton();
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

  return (
    <Flex
      as="button"
      w="full"
      display="flex"
      alignItems="center"
      rounded="lg"
      bg="gray.700"
      px="3"
      py="2"
      userSelect="none"
      cursor="pointer"
      transition="all 0.2s"
      _focus={{ shadow: "outline" }}
      {...menuButtonProps}
    >
      <HStack flex="1" spacing="3">
        <Img w="8" h="8" rounded="md" objectFit="cover" src={avatarUrl} alt="Chakra UI" />
        <Box textAlign="start">
          <Box isTruncated fontWeight="semibold">
            {user.username}#{user.discriminator}
          </Box>
          <Box fontSize="xs" color="gray.400">
            {user.email ?? "No Email"}
          </Box>
        </Box>
      </HStack>
      <Box fontSize="lg" color="gray.400">
        <HiSelector />
      </Box>
    </Flex>
  );
};

type ProfileProps = {
  user: User;
};

const Profile = ({ user }: ProfileProps) => {
  return (
    <Menu>
      <ProfileButton user={user} />
      <MenuList shadow="lg" color={useColorModeValue("gray.600", "gray.200")} px="3">
        <Link href="/api/logout">
          <a>
            <MenuItem rounded="md">Sign Out</MenuItem>
          </a>
        </Link>
      </MenuList>
    </Menu>
  );
};

type NavItemProps = {
  href: string;
  label: string;
  subtle?: boolean;
  icon: React.ReactElement;
};

const NavItem = ({ href, subtle = false, icon, label }: NavItemProps) => {
  const { asPath } = useRouter();
  const active = href === asPath;

  return (
    <Link href={href} passHref>
      <HStack
        as="a"
        w="full"
        px="3"
        py="2"
        cursor="pointer"
        rounded="lg"
        transition="all 0.2s"
        bg={active ? "gray.700" : undefined}
        _hover={{ bg: "gray.700" }}
        _active={{ bg: "gray.600" }}
      >
        <Box fontSize="lg" color={active ? "currentcolor" : "gray.400"}>
          {icon}
        </Box>
        <Box flex="1" fontWeight="inherit" color={subtle ? "gray.400" : undefined}>
          {label}
        </Box>
      </HStack>
    </Link>
  );
};

type MainLayoutProps = PropsWithChildren<{
  user: User;
}>;

const MainLayout = ({ user, children }: MainLayoutProps) => {
  return (
    <Box height="100vh" overflow="hidden" position="relative">
      <Flex h="full">
        <Stack
          spacing="4"
          direction="column"
          px="4"
          py="4"
          w="64"
          bg="gray.900"
          color="white"
          fontSize="sm"
          overflow="scroll"
        >
          <Profile user={user} />

          <Stack spacing="1" flex="1">
            <NavItem href="/dashboard" icon={<HiHome />} label="Home" />
            <NavItem
              href="/a/moderator-application"
              icon={<HiShieldExclamation />}
              label="Moderator Application"
            />
            <NavItem href="/a/ban-appeal" icon={<HiBan />} label="Ban Appeal" />
          </Stack>

          <NavItem href="/api/logout" icon={<HiLogout />} label="Sign Out" />
        </Stack>

        <Box flex="1" bg={useColorModeValue("white", "gray.800")} p="8" overflow="scroll">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default MainLayout;
