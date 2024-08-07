import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FlexProps,
  Heading,
  HStack,
  Icon,
  IconButton,
  Img,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useMenuButton,
} from "@chakra-ui/react";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { HiClipboardList, HiHome, HiLogout, HiMoon, HiSelector, HiSun } from "react-icons/hi";

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
        <Link href="/api/logout" passHref legacyBehavior>
          <MenuItem as="a" rounded="md">Sign Out</MenuItem>
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
  const active = asPath.startsWith(href);

  return (
    <Link href={href} passHref legacyBehavior>
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

const Navigation = () => (
  <Stack spacing="1">
    <NavItem href="/dashboard" icon={<HiHome />} label="Home" />
    <NavItem
      href="/a/moderator-application"
      icon={<HiClipboardList />}
      label="Moderator Application"
    />
    <NavItem href="/a/ban-appeal" icon={<HiClipboardList />} label="Server Ban Appeal" />
    <NavItem href="/a/suspension-appeal" icon={<HiClipboardList />} label="Bot Suspension Appeal" />
  </Stack>
);

export type MainLayoutProps = PropsWithChildren<{
  user: User;
  contentContainerProps?: BoxProps;
}>;

const MainLayout = ({ user, contentContainerProps = {}, children }: MainLayoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const shadow = useColorModeValue("base", "md");

  return (
    <Box height="100vh" overflow="hidden" position="relative">
      <HStack
        h="12"
        px="6"
        shadow={shadow}
        display={{ base: "flex", xl: "none" }}
        position="relative"
        zIndex={3}
      >
        <IconButton
          aria-label="Toggle navigation"
          variant="ghost"
          icon={<HamburgerIcon boxSize={6} />}
          onClick={onOpen}
        />
        <Heading size="sm">Pokétwo Forms Site</Heading>
      </HStack>

      <Flex flex="1" h="full">
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="gray.900" color="white">
            <DrawerCloseButton />
            <DrawerHeader>Pokétwo Forms Site</DrawerHeader>
            <DrawerBody>
              <Stack h="full" spacing="4">
                <Profile user={user} />
                <Stack spacing="4" flex="1">
                  <Navigation />
                </Stack>
                <NavItem href="/api/logout" icon={<HiLogout />} label="Sign Out" />
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Stack
          spacing="4"
          p="4"
          w="64"
          bg="gray.900"
          color="white"
          fontSize="sm"
          overflow="auto"
          shadow={shadow}
          zIndex={3}
          display={{ base: "none", xl: "flex" }}
        >
          <Profile user={user} />

          <Stack spacing="4" flex="1">
            <Navigation />
          </Stack>

          <NavItem href="/api/logout" icon={<HiLogout />} label="Sign Out" />
        </Stack>

        <Box flex="1" p="8" overflow="auto" {...contentContainerProps}>
          {children}
        </Box>
      </Flex>

      <IconButton
        aria-label="Toggle color theme"
        position="fixed"
        bottom="4"
        right="4"
        variant="ghost"
        rounded="full"
        size="lg"
        icon={colorMode === "light" ? <Icon as={HiMoon} /> : <Icon as={HiSun} />}
        onClick={toggleColorMode}
      />
    </Box>
  );
};

export default MainLayout;
