import { Extension } from "@tiptap/core";

export const ListExit = Extension.create({
  name: "listExit",

  addKeyboardShortcuts() {
    return {
      "Enter Enter": ({ editor }) => {
        if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
          editor.commands.liftListItem("listItem");
          return true;
        }
        return false;
      },
    };
  },
});
