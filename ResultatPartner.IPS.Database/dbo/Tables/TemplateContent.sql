CREATE TABLE [dbo].[TemplateContent] (
    [TemplateContentID]  INT            IDENTITY (1, 1) NOT NULL,
    [Title]              VARCHAR (1000) NULL,
    [TemplateCategoryID] INT            NULL,
    [Description]        VARCHAR (5000) NULL,
    [LanguageID]         INT            CONSTRAINT [DF_TemplateContent_LanguageID] DEFAULT ((1)) NULL,
    [IsDeleted]          BIT            CONSTRAINT [DF_TemplateContent_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_TemplateContent] PRIMARY KEY CLUSTERED ([TemplateContentID] ASC),
    CONSTRAINT [FK_TemplateContent_TemplateCategory] FOREIGN KEY ([TemplateCategoryID]) REFERENCES [dbo].[TemplateCategory] ([TemplateCategoryID])
);

