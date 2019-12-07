CREATE TABLE [dbo].[TemplateContentImage] (
    [TemplateImageID]   INT            IDENTITY (1, 1) NOT NULL,
    [TemplateContentID] INT            NULL,
    [ImagePath]         VARCHAR (1000) NULL,
    [IsPrimaryImage]    BIT            CONSTRAINT [DF_TemplateContentImage_IsPrimaryImage] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_TemplateContentImage] PRIMARY KEY CLUSTERED ([TemplateImageID] ASC),
    CONSTRAINT [FK_TemplateContentImage_TemplateContent] FOREIGN KEY ([TemplateContentID]) REFERENCES [dbo].[TemplateContent] ([TemplateContentID])
);

