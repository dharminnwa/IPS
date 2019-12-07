CREATE TABLE [dbo].[CmsPages] (
    [PageID]          INT            IDENTITY (1, 1) NOT NULL,
    [Title]           VARCHAR (5000) NULL,
    [MetaTitle]       VARCHAR (2000) NULL,
    [MetaKeyWord]     VARCHAR (2000) NULL,
    [MetaDescription] VARCHAR (2000) NULL,
    [Heading]         VARCHAR (2000) NULL,
    [Description]     NVARCHAR (MAX) NULL,
    [PageContent]     NVARCHAR (MAX) NULL,
    [LanguageID]      INT            NULL,
    [PageAccessCode]  INT            NULL,
    CONSTRAINT [PK_CmsPages] PRIMARY KEY CLUSTERED ([PageID] ASC),
    CONSTRAINT [FK_CmsPages_LookupItems] FOREIGN KEY ([LanguageID]) REFERENCES [dbo].[LookupItems] ([Id])
);

