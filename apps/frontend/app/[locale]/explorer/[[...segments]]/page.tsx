import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react/jsx-runtime';
import { getFolderData } from './_queries/get-folder-data';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { components } from '@/lib/types/openapi';
import { ItemGroup } from '@/components/ui/item';

const ExplorerElementUp = dynamic(() => {
  return import('./_components/explorer-element-up').then((module) => {
    return module.ExplorerElementUp;
  });
});

const ExplorerElementFolder = dynamic(() => {
  return import('./_components/explorer-element-folder').then((module) => {
    return module.ExplorerElementFolder;
  });
});

const ExplorerElementFile = dynamic(() => {
  return import('./_components/explorer-element-file').then((module) => {
    return module.ExplorerElementFile;
  });
});

const folderDataItemToHref = (
  folderDataItem: components['schemas']['FolderDataItemFolder'] | components['schemas']['FolderDataItemFile'],
) => {
  return ['/explorer', folderDataItem.path].join('/');
};

export default async function Explorer({ params }: Readonly<PageProps<'/[locale]/explorer/[[...segments]]'>>) {
  const { segments = [] } = await params;
  const t = await getTranslations('Explorer');

  const { data: folderData } = await getFolderData(segments.join('/') || '/');
  if (!folderData) {
    return notFound();
  }

  const navigationItems = folderData.pathDirectory
    .split('/')
    .filter(Boolean)
    .reduce(
      (segments, segment) => {
        return [
          ...segments,
          {
            text: segment,
            href: [segments.at(-1)?.href, segment].join('/'),
          },
        ];
      },
      [
        {
          text: 'root',
          href: '/explorer',
        },
      ],
    );

  const breadcrumbPage = navigationItems.at(-1);
  const breadcrumbLinks = navigationItems.slice(0, -1);

  const navigationItemUp = navigationItems.at(-2);

  return (
    <section className="layout-container pb-4">
      <h1 className="h1 mb-4">{t('content')}</h1>

      <Breadcrumb className="mb-4 sticky top-header-height">
        <BreadcrumbList>
          {breadcrumbLinks.map((link, index) => {
            return (
              <Fragment key={index}>
                <BreadcrumbLink render={<Link href={link.href} />}>{link.text}</BreadcrumbLink>
                <BreadcrumbSeparator />
              </Fragment>
            );
          })}
          <BreadcrumbPage className="text-primary">{breadcrumbPage?.text}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <ItemGroup className="gap-4!">
        <nav className="contents">
          {navigationItemUp && <ExplorerElementUp href={navigationItemUp.href} />}
          {folderData.folders.map((folder) => {
            return <ExplorerElementFolder key={folder.name} element={folder} href={folderDataItemToHref(folder)} />;
          })}
        </nav>
        {folderData.files.map((file) => {
          return <ExplorerElementFile key={file.name} element={file} href={folderDataItemToHref(file)} />;
        })}
      </ItemGroup>
    </section>
  );
}
