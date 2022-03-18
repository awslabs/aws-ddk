import setuptools

with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="ddk_lib",
    version="0.0.1",
    description="An empty DDK Python library",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="author",
    package_dir={"": "ddk_lib"},
    packages=setuptools.find_packages(where="ddk_lib"),
    install_requires=open("requirements.txt").read().strip().split("\n"),
    python_requires=">=3.6",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",
        "Typing :: Typed",
    ],
)
