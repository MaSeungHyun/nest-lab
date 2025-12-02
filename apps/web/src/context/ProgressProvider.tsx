import { useProgressStore } from "../hooks/useProgress";
import { Dialog } from "../components/Dialog";
import Icon from "../components/Icon";
import Progress from "../components/Progress";

export const ProgressProvider = () => {
  const { isOpen, config, close } = useProgressStore();

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Content>
        {config.title && (
          <Dialog.Title>
            {config.icon ? (
              <div className="flex items-center gap-2">
                <Icon icon={config.icon as keyof typeof icons} size={17} />
                <span>{config.title}</span>
              </div>
            ) : (
              config.title
            )}
          </Dialog.Title>
        )}
        {config.description && (
          <Dialog.Description>{config.description}</Dialog.Description>
        )}

        <Dialog.Footer>
          <Progress value={config.progress ?? 0} max={100} />
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};
