import { Stack, Text, useColorModeValue } from "@chakra-ui/react";

import { AppealFormId } from "~helpers/punishment";
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

type RowProps = { label: string; value: string };

const Row = ({ label, value }: RowProps) => (
  <Text>
    <Text as="span" color="gray.500">
      {label}:
    </Text>{" "}
    {value}
  </Text>
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
  const network = live?.network ?? submitted?.network;

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

      {submitted?.account && <Row label="When submitted" value={formatRecord(submitted.account)} />}
      <Row
        label="Now"
        value={
          live === null
            ? `Couldn't reach ${labels.source}`
            : live.account
            ? formatRecord(live.account)
            : labels.lifted
        }
      />
      {network && (
        <Row
          label={`Network suspension (${NETWORK_KIND_LABELS[network.kind] ?? network.kind})`}
          value={formatRecord(network)}
        />
      )}
    </Stack>
  );
};

export default PunishmentCard;
