// import Content from './hello.mdx';
import { promises as fs, } from 'fs';
import path from 'path';

export default function Post({ content: Content }) {
  return (
    <div>
      {Content}
    </div>
  );
};

export async function getStaticPaths(paths) {
  console.log('paths', paths);
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps(props) {
  console.log('props', props);
  const filepath = path.join(process.cwd(), './src/pages/posts/hello.mdx');
  console.log(filepath);
  const Content = await fs.readFile(filepath);
  console.log('Content', Content.toString());
  return { props: { content: Content.toString() } };
}