import { Stack, Text, useColorModeValue } from "@chakra-ui/react";

import { AppealFormId } from "~helpers/form";
import { Punishment, PunishmentRecord } from "~helpers/types";

const LABELS: { [key in AppealFormId]: { title: string; source: string; lifted: string } } = {
  "ban-appeal": { title: "Ban reason", source: "Discord", lifted: "Not banned anymore" },
  "suspension-appeal": {
    title: "Suspension reason",
    source: "Pokétwo",
    lifted: "Not suspended anymore",
  },
};

const NETWORK_KIND_LABELS: { [kind: string]: string } = {
  ip: "IP",
  subnet: "subnet",
  asn: "provider",
  hosting: "hosting",
};

const formatUntil = (until: string) =>
  new Date(until).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";

const formatRecord = (record: PunishmentRecord) =>
  (record.reason ?? "No reason given") +
  (record.until ? ` (until ${formatUntil(record.until)})` : "");

const describe = (punishment: Punishment, lifted: string) => {
  const { account, network } = punishment;
  const lines = [];
  if (account) lines.push(formatRecord(account));
  if (network) {
    const kind = NETWORK_KIND_LABELS[network.kind] ?? network.kind;
    lines.push(`Network suspension (${kind}): ${formatRecord(network)}`);
  }
  return lines.length > 0 ? lines : [lifted];
};

type RowProps = { label: string; lines: string[] };

const Row = ({ label, lines }: RowProps) => (
  <Stack spacing="0">
    <Text color="gray.500">{label}</Text>
    {lines.map((line) => (
      <Text key={line}>{line}</Text>
    ))}
  </Stack>
);

type PunishmentCardProps = {
  formId: AppealFormId;
  submitted: Punishment | null;
  // null when the live lookup failed.
  live: Punishment | null;
};

const PunishmentCard = ({ formId, submitted, live }: PunishmentCardProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("base", "md");
  const labels = LABELS[formId];

  return (
    <Stack shadow={shadow} bg={bg} rounded="md" p="4" alignItems="flex-start">
      <Text
        fontWeight="bold"
        _after={{
          content: `"from ${labels.source}"`,
          ml: 2,
          color: "gray.500",
          fontWeight: "normal",
          fontSize: "sm",
        }}
      >
        {labels.title}
      </Text>

      {submitted && <Row label="When submitted" lines={describe(submitted, labels.lifted)} />}
      <Row
        label="Now"
        lines={live === null ? [`Couldn't reach ${labels.source}`] : describe(live, labels.lifted)}
      />
    </Stack>
  );
};

export default PunishmentCard;
