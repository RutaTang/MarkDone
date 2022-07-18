import { Circle } from "lucide-react";

const renderListItem = ({ attributes, children, element }) => {
  switch (element.type) {
    case "ELEMENT_LIST_ITEM": {
      return (
        <li className="flex" {...attributes}>
          <Circle size="1rem" />
          <div className="ml-1">{children}</div>
        </li>
      );
    }
    default: {
      return null;
    }
  }
};

const withListItem = (editor) => {
  return editor;
};

export default withListItem;
export { renderListItem };
