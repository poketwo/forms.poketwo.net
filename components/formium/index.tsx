import { defaultComponents, FormiumComponents } from "@formium/react";

import Checkbox from "./Checkbox";
import ElementsWrapper from "./ElementsWrapper";
import FieldWrapper from "./FieldWrapper";
import FooterWrapper from "./FooterWrapper";
import FormControl from "./FormControl";
import Header from "./Header";
import NextButton from "./NextButton";
import PageWrapper from "./PageWrapper";
import PreviousButton from "./PreviousButton";
import Radio from "./Radio";
import SubmitButton from "./SubmitButton";
import TextInput from "./TextInput";
import Textarea from "./Textarea";

const components: FormiumComponents = {
  ...defaultComponents,
  ElementsWrapper,
  FormControl,
  TextInput,
  Textarea,
  Checkbox,
  NextButton,
  FieldWrapper,
  FooterWrapper,
  PreviousButton,
  Radio,
  PageWrapper,
  Header,
  SubmitButton,
};

export default components;
