import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { millisecondsToHumanReadable } from '@/lib/utils/milliseconds-to-human-readable';
import { Calendar, Clock, Disc3, Metronome, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentProps } from 'react';
import { ExplorerElementTime } from './explorer-element-time';

export const ExplorerElementFileAudio = ({
  element,
  ...props
}: ComponentProps<typeof Link> & { element: components['schemas']['FolderDataItemAudio'] }) => {
  const t = useTranslations('ExplorerElementAudio');

  const metadataItems = [
    ...(element.metadata.duration
      ? [
          {
            key: 'duration',
            title: t('duration'),
            Icon: Clock,
            value: millisecondsToHumanReadable(element.metadata.duration),
          },
        ]
      : []),
    ...(element.metadata.artists.length > 0
      ? [
          {
            key: 'artists',
            title: t('artists'),
            Icon: Users,
            value: element.metadata.artists.join(' & '),
          },
        ]
      : []),
    ...(element.metadata.album
      ? [
          {
            key: 'album',
            title: t('album'),
            Icon: Disc3,
            value: element.metadata.album,
          },
        ]
      : []),
    ...(element.metadata.year
      ? [
          {
            key: 'year',
            title: t('year'),
            Icon: Calendar,
            value: String(element.metadata.year),
          },
        ]
      : []),
    ...(element.metadata.bpm
      ? [
          {
            key: 'bpm',
            title: t('bpm'),
            Icon: Metronome,
            value: String(element.metadata.bpm),
          },
        ]
      : []),
  ];

  return (
    <article className="contents">
      <Item className="border-primary" render={<Link {...props} />}>
        <ItemHeader>
          <header className="text-lg">{element.name}</header>
          <ExplorerElementTime element={element} />
        </ItemHeader>
        <Separator />
        <ItemContent className="w-full">
          <ItemGroup className="flex-row overflow-x-auto">
            {metadataItems.map((metadataItem) => {
              return (
                <Item size="xs" className="flex-nowrap" key={metadataItem.key}>
                  <ItemMedia className="self-center! pb-0.5">
                    <metadataItem.Icon className="size-6" />
                  </ItemMedia>
                  <ItemContent className="text-nowrap">
                    <ItemTitle className="text-muted-foreground font-normal">{metadataItem.title}</ItemTitle>
                    <ItemDescription className="text-secondary-foreground text-sm!">
                      {metadataItem.value}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              );
            })}
          </ItemGroup>
        </ItemContent>
      </Item>
    </article>
  );
};
