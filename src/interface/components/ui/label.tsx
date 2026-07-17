import type { ComponentProps, JSX } from 'solid-js';
import { splitProps } from 'solid-js';
import { cn } from '@interface/lib/utils';

type LabelProps = ComponentProps<'label'>;

const Label = (props: LabelProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    // Callsites supply `for` / wrap controls; generic Label cannot know the id.
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- primitive
    <label
      class={cn(
        'z-label flex select-none items-center peer-disabled:cursor-not-allowed group-data-[disabled=true]:pointer-events-none',
        local.class,
      )}
      data-slot="label"
      {...others}
    />
  );
};

export { Label, type LabelProps };
