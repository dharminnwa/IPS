CREATE TABLE [dbo].[UserOrganizations] (
    [UserId]         NVARCHAR (128) NOT NULL,
    [OrganizationId] INT            NOT NULL,
    CONSTRAINT [PK_UserOrganizations] PRIMARY KEY CLUSTERED ([UserId] ASC, [OrganizationId] ASC),
    CONSTRAINT [FK_UserOrganizations_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id])
);

