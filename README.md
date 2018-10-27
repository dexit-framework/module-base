# @dexit/module-base

Base utilities and typings for a [Dexit](https://github.com/dexit-framework/dexit) module.

**What is Dexit?**

The [Dexit](https://github.com/dexit-framework/dexit) aims to create a framework for integration testing of complex applications which consist of various services such as API servers, databases, pub/sub systems and so on. The [Dexit](https://github.com/dexit-framework/dexit) allows you to easily test these services altogether.

## Usage

**Install the package:**

```
npm install --save @dexit/module-base
```

**Use typings in your Dexit module:**

```
import { ITestModule } from "@dexit/module-base"

const MyModule: ITestModule = {
    ...
};

module.exports = MyModule;
```

## License Apache 2.0

Copyright 2018 Jiri Hybek <jiri@hybek.cz>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.