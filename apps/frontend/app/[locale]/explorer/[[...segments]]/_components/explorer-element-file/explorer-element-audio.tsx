import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia } from '@/components/ui/item';
import { Link } from '@/i18n/navigation';
import { components } from '@/lib/types/openapi';
import { millisecondsToHumanReadable } from '@/lib/utils/milliseconds-to-human-readable';
import { Calendar, Clock, Disc3, Metronome, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentProps } from 'react';

export const ExplorerElementAudio = ({
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
    <Item variant="outline" render={<Link {...props} />}>
      <ItemHeader className="text-lg">{element.name}</ItemHeader>
      <ItemContent>
        <ItemGroup className="flex-row">
          {metadataItems.map((metadataItem) => {
            return (
              <Item variant="outline" size="xs" key={metadataItem.key}>
                <ItemMedia className="self-center! pb-1">
                  <metadataItem.Icon className="size-8" />
                </ItemMedia>
                <div>
                  <ItemHeader className="text-muted-foreground">{metadataItem.title}</ItemHeader>
                  <ItemContent>
                    <ItemDescription className="text-primary-foreground text-base!">
                      {metadataItem.value}
                    </ItemDescription>
                  </ItemContent>
                </div>
              </Item>
            );
          })}
        </ItemGroup>
      </ItemContent>
    </Item>
  );
};
