CREATE TABLE [dbo].[ContactUs] (
    [ContactID] INT            IDENTITY (1, 1) NOT NULL,
    [Question]  VARCHAR (5000) NULL,
    [Name]      VARCHAR (1000) NULL,
    [Email]     VARCHAR (1000) NULL,
    [Phone]     VARCHAR (1000) NULL,
    [Comment]   VARCHAR (1000) NULL,
    CONSTRAINT [PK_ContactUs] PRIMARY KEY CLUSTERED ([ContactID] ASC)
);

