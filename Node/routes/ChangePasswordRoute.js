router.put("/change-password", authMiddleware, async (req, res) => {
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
        password: hashedPassword,
        isFirstLogin: false,
    });

    res.json({ message: "Password updated successfully" });
});