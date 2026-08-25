import { createContext, PropsWithChildren, useContext } from "react";

import VideoEvidenceField, { VideoEvidenceFieldProps } from "./VideoEvidenceField";

const VideoEvidenceContext = createContext<VideoEvidenceFieldProps | undefined>(undefined);

export const VideoEvidenceProvider = ({
  children,
  links,
  onChange,
}: PropsWithChildren<VideoEvidenceFieldProps>) => (
  <VideoEvidenceContext.Provider value={{ links, onChange }}>
    {children}
  </VideoEvidenceContext.Provider>
);

const VideoEvidenceSlot = () => {
  const props = useContext(VideoEvidenceContext);
  return props ? <VideoEvidenceField {...props} /> : null;
};

export default VideoEvidenceSlot;
